export const onRequest = async (context) => {
  // 确保 D1 数据库绑定正确传递
  if (!context.env.DB && context.platform?.env?.DB) {
    context.env.DB = context.platform.env.DB;
  }
  
  // 设置兼容性标志
  return context.next();
};