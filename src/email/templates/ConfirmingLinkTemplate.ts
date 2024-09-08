interface IConfirmingLinkTemplate {
  link: string;
}

export const ConfirmingLinkTemplate = (data: IConfirmingLinkTemplate) => {
  const { link } = data;
  return `<div>Перейдите по ссылке для активации аккаунта: ${link}</div>`;
};
