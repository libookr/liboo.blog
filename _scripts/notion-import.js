const { Client } = require("@notionhq/client");
const { NotionToMarkdown } = require("notion-to-md");
const moment = require("moment");
const path = require("path");
const fs = require("fs");
const axios = require("axios");

const notion = new Client({
    auth: process.env.NOTION_TOKEN,
});

function escapeCodeBlock(body) {
    const regex = /```([\s\S]*?)```/g
    return body.replace(regex, function (match, htmlBlock) {
        return "\n```\n" + htmlBlock + "\n```\n";
    })
}

function replaceTitleOutsideRawBlocks(body) {
    const rawBlocks = [];
    const placeholder = "%%RAW_BLOCK%%";
    body = body.replace(/[\s\S]*?/g, (match) => {
        rawBlocks.push(match);
        return placeholder;
    });

    const regex = /\n#[^\n]+\n/g;
    body = body.replace(regex, function (match) {
        return "\n" + match.replace("\n#", "\n##");
    });

    rawBlocks.forEach(block => {
        body = body.replace(placeholder, block);
    });

    return body;
}

// passing notion client to the option
const n2m = new NotionToMarkdown({ notionClient: notion });

(async () => {
    // ensure directory exists
    const root = "_posts";
    fs.mkdirSync(root, { recursive: true });

    const databaseId = process.env.DATABASE_ID;
    let response = await notion.databases.query({
        database_id: databaseId,
        filter: {
            property: "상태",
            checkbox: {
                equals: "작성 완료",
            },
        },
    });

    const pages = response.results;
    while (response.has_more) {
        const nextCursor = response.next_cursor;
        response = await notion.databases.query({
            database_id: databaseId,
            start_cursor: nextCursor,
            filter: {
                property: "상태",
                select: {
                    equals: "작성 완료",
                },
            },
        });
        pages.push(...response.results);
    }

    for (const r of pages) {
        const id = r.id;
        // date
        let date = moment(r.created_time).format("YYYY-MM-DD hh:mm:ss");
        let pdate = r.properties?.["날짜"]?.["date"]?.["start"];
        if (pdate) {
            date = moment(pdate).format("YYYY-MM-DD");
        }
        // title
        let title = id;
        let ptitle = r.properties?.["게시물"]?.["title"];
        if (ptitle?.length > 0) {
            title = ptitle[0]?.["plain_text"];
        }
        // tags
        let tags = [];
        let ptags = r.properties?.["태그"]?.["multi_select"];
        for (const t of ptags) {
            const n = t?.["name"];
            if (n) {
                tags.push(n);
            }
        }

        // categories
        let cats = [];
        let pcats = r.properties?.["카테고리"]?.["multi_select"];
        for (const t of pcats) {
            const n = t?.["name"];
            if (n) {
                cats.push(n);
            }
        }

        // author
        let author = r.properties?.["작성자"];

        // frontmatter
        let fmtags = "";
        let fmcats = "";
        let fmassrtmnt = "";
        if (tags.length > 0) {
            fmtags += "[";
            for (const t of tags) {
                fmtags += t + ", ";
            }
            fmtags += "]";
        }

        if (assrtmnt.length > 0) {
            fmassrtmnt += "[";
            for (const t of assrtmnt) {
                fmassrtmnt += t ;
            }
            fmassrtmnt += "]";
        }
        const fm = `---
layout: post
current: post
cover: 'assets/images/piano.jpg'
navigation: true
title: "${title}"
date: ${date}
tags:
    - ${fmtags}
class: post-template
subclass: 'post'
author: "${author}"
categories:
    - ${fmcats}
---
<br><br>
`;
        const mdblocks = await n2m.pageToMarkdown(id);
        let body = n2m.toMarkdownString(mdblocks)["parent"];
        if (body === "") {
            continue;
        }
        body = escapeCodeBlock(body);
        body = replaceTitleOutsideRawBlocks(body);

        const ftitle = `${date}-${title.replaceAll(" ", "_")}.md`;

        let index = 0;
        let edited_md = body.replace(
            /!\[(.*?)\]\((.*?)\)/g,
            function (match, p1, p2, p3) {
                // const dirname = path.join("assets/img", ftitle);
                const dirname = path.join("upload", ftitle);
                if (!fs.existsSync(dirname)) {
                    fs.mkdirSync(dirname, { recursive: true });
                }
                const filename = path.join(dirname, `${index}.png`);

                axios({
                    method: "get",
                    url: p2,
                    responseType: "stream",
                })
                    .then(function (response) {
                        let file = fs.createWriteStream(`${filename}`);
                        response.data.pipe(file);
                    })
                    .catch(function (error) {
                        console.log(error);
                    });

                let res;
                if (p1 === "") res = "";
                else res = `_${p1}_`;

                return `![${index++}](/${filename})${res}`;
            }
        );

        //writing to file
        fs.writeFile(path.join(root, ftitle), fm + edited_md, (err) => {
            if (err) {
                console.log(err);
            }
        });
    }
})();
