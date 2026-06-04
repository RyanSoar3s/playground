const generateId = () => {
  const id = crypto.randomUUID().replaceAll("-", "").toUpperCase();
  return `exec_${id}`;

}

export default generateId;
