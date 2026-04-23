const cleanDescription = (raw) => {
    if (!raw) return '';
    let desc = raw.trim();

    // 1. Unescape common escapes like \", \r, \n
    desc = desc.replace(/\\"/g, '"').replace(/\\n/g, ' ').replace(/\\r/g, ' ').replace(/\\t/g, ' ');

    // 2. If it is a perfect JSON object, extract description
    if (desc.startsWith('{') || desc.startsWith('[')) {
      try {
        const parsed = JSON.parse(desc);
        if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) {
          const content = parsed.description || parsed.summary || parsed.about || parsed.content || '';
          if (content) return cleanDescription(content);
        }
      } catch (e) {}
    }

    // 3. Remove patterns like "key": value OR key: value
    // This is aggressive: matches "quotedKey": value, unquotedKey: value
    // Handling: strings, numbers, booleans, null, empty objects/arrays
    const jsonPattern = /"[^"]*"\s*:\s*(?:"[^"]*"|null|true|false|\d+|\[\]|\{\})/g;
    const unquotedPattern = /\b[a-z_][a-z0-9_]*\s*:\s*(?:"[^"]*"|null|true|false|\d+|\[\]|\{\})/gi;
    
    desc = desc.replace(jsonPattern, ' ');
    desc = desc.replace(unquotedPattern, ' ');

    // 4. Decode HTML entities
    desc = desc
      .replace(/&quot;/g, '"')
      .replace(/&amp;/g, '&')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&#39;/g, "'");

    // 5. Iteratively remove any brackets contents
    let prev = '';
    while (prev !== desc) {
      prev = desc;
      desc = desc.replace(/\{[^{}]*\}/g, ' ').replace(/\[[^\[\]]*\]/g, ' ');
    }

    // 6. Final cleanup of strays: quotes, colons, commas, brackets
    desc = desc.replace(/[{}[\],":]/g, ' ');

    // 7. Collapse whitespace
    return desc.replace(/\s+/g, ' ').trim();
  };

  const test1 = '{"name":"Virtusa","logo":null,"website":null,"description":null,"industry":"IT Jobs","size":null,"founded":null,"headquarters":"Tampa","benefits":[],"culture":null,"rating":null,"reviews_count":null,"social_media":{},"career_page":null}';
  const test2 = 'Depot","logo":null,"website":null,"description":null,"industry":"IT Jobs","size":null,"founded":null,"headquarters":"US","benefits":[],"culture":null,"rating":null,"reviews_count":null,"social_media":{},"career_page":null}';
  const test3 = '{"name":"Home Depot","logo":null,"website":null,"description":null,"industry":"IT Jobs","size":null,"founded":null,"headquarters":"US","benefits":[],"culture":null,"rating":null,"reviews_count":null,"social_media":{},"career_page":null}';

  console.log('test1 result:', `[${cleanDescription(test1)}]`);
  console.log('test2 result:', `[${cleanDescription(test2)}]`);
  console.log('test3 result:', `[${cleanDescription(test3)}]`);
