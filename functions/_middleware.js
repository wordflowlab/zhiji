export const onRequest = async (context) => {
  // 设置兼容性标志
  return context.next();
};