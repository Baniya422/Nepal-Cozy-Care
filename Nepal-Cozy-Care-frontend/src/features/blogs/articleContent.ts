export function parseArticleSections(content: string) {
  const sections: { heading: string | null; paras: string[] }[] = [];
  let current: { heading: string | null; paras: string[] } = { heading: null, paras: [] };
  let paragraph: string[] = [];
  const flush = () => {
    if (paragraph.length) current.paras.push(paragraph.join("\n"));
    paragraph = [];
  };
  for (const line of content.split(/\r?\n/)) {
    const heading = line.match(/^#{1,6}\s+(.+)$/);
    if (heading) {
      flush();
      if (current.heading || current.paras.length) sections.push(current);
      current = { heading: heading[1], paras: [] };
    } else if (!line.trim()) {
      flush();
    } else {
      paragraph.push(line);
    }
  }
  flush();
  if (current.heading || current.paras.length) sections.push(current);
  return sections;
}
