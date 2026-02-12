import { parse } from 'node-html-parser';

// Debug the HTML structure
const htmlContent = `
<!DOCTYPE NETSCAPE-Bookmark-file-1>
<META HTTP-EQUIV="Content-Type" CONTENT="text/html; charset=UTF-8">
<TITLE>Bookmarks</TITLE>
<H1>Bookmarks Menu</H1>
<DL><p>
    <DT><A HREF="https://www.google.com" ADD_DATE="1640995200" LAST_MODIFIED="1640995200">Google</A>
    <DT><A HREF="https://www.github.com" ADD_DATE="1640995300" LAST_MODIFIED="1640995300">GitHub</A>
    <DT><H3 ADD_DATE="1640995400" LAST_MODIFIED="1640995400">Development</H3>
    <DL><p>
        <DT><A HREF="https://developer.mozilla.org" ADD_DATE="1640995500" LAST_MODIFIED="1640995500">MDN Web Docs</A>
        <DT><A HREF="https://stackoverflow.com" ADD_DATE="1640995600" LAST_MODIFIED="1640995600">Stack Overflow</A>
    </DL><p>
    <DT><H3 ADD_DATE="1640995700" LAST_MODIFIED="1640995700">News</H3>
    <DL><p>
        <DT><A HREF="https://news.ycombinator.com" ADD_DATE="1640995800" LAST_MODIFIED="1640995800">Hacker News</A>
        <DT><H3 ADD_DATE="1640995900" LAST_MODIFIED="1640995900">Technology</H3>
        <DL><p>
            <DT><A HREF="https://techcrunch.com" ADD_DATE="1640996000" LAST_MODIFIED="1640996000">TechCrunch</A>
            <DT><A HREF="https://arstechnica.com" ADD_DATE="1640996100" LAST_MODIFIED="1640996100">Ars Technica</A>
        </DL><p>
    </DL><p>
    <DT><A HREF="https://www.youtube.com" ADD_DATE="1640996200" LAST_MODIFIED="1640996200">YouTube</A>
</DL><p>
`;

const root = parse(htmlContent);
console.log('Root children:', root.childNodes.map(node => ({
  type: node.nodeType,
  tagName: node.tagName,
  text: node.textContent?.substring(0, 50)
})));

const mainDL = root.querySelector('dl');
console.log('Main DL found:', !!mainDL);

if (mainDL) {
  console.log('Main DL children count:', mainDL.childNodes.length);
  Array.from(mainDL.childNodes).forEach((node, index) => {
    console.log(`Child ${index}: type=${node.nodeType}, tagName=${node.tagName}, text="${node.textContent?.substring(0, 30)}"`);
    if (node.tagName === 'DT') {
      console.log(`  DT content: ${node.innerHTML}`);
    }
  });
  
  // Let's also check for DT elements directly
  const dtElements = mainDL.querySelectorAll('dt');
  console.log(`Found ${dtElements.length} DT elements`);
  dtElements.forEach((dt, index) => {
    console.log(`DT ${index}: ${dt.innerHTML.substring(0, 100)}`);
  });
}