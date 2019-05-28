exports.arrayToTree = (data, priKey = 'id', parentKey = 'parent') => {

  const ref = {};
  const res = [];

  data.forEach((node) => {
    ref[node[priKey]] = { ...node, children:[] };
  });

  Object.keys(ref).forEach((key) => {
    const node = ref[key];
    if (node[parentKey] === '0') {
      res.push(node);
    } else {
      if(ref[node[parentKey]]){
        ref[node[parentKey]].children.push(node);
      }
    }
  });
  return res;
};
