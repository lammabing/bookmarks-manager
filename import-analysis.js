/**
 * Sample HTML bookmark file structure from browsers like Chrome/Firefox:
 * 
 * <!DOCTYPE NETSCAPE-Bookmark-file-1>
 * <META HTTP-EQUIV="Content-Type" CONTENT="text/html; charset=UTF-8">
 * <TITLE>Bookmarks</TITLE>
 * <H1>Bookmarks Menu</H1>
 * <DL><p>
 *     <DT><A HREF="https://www.example.com" ADD_DATE="1234567890" LAST_MODIFIED="1234567890">Example Site</A>
 *     <DT><H3 ADD_DATE="1234567890" LAST_MODIFIED="1234567890">Folder Name</H3>
 *     <DL><p>
 *         <DT><A HREF="https://www.another-example.com" ADD_DATE="1234567890" LAST_MODIFIED="1234567890">Another Example</A>
 *     </DL><p>
 * </DL><p>
 */

// Common structure:
// - <!DOCTYPE NETSCAPE-Bookmark-file-1> - Document type
// - <DT><A HREF="url" ADD_DATE="timestamp" LAST_MODIFIED="timestamp">Title</A> - Individual bookmarks
// - <DT><H3 ADD_DATE="timestamp" LAST_MODIFIED="timestamp">Folder Name</H3> - Folders
// - <DL><p>...</DL><p> - Folder containers
// - Attributes: HREF (URL), ADD_DATE (Unix timestamp), LAST_MODIFIED (Unix timestamp)