interface IResetPasswordTemplate {
  link: string;
}

export const resetPasswordTemplate = (data: IResetPasswordTemplate) => {
  const { link } = data;
  return `<div>Перейдите по ссылке для восстановления: ${link}</div>`;
};
