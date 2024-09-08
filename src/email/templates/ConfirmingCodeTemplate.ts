interface IConfirmingCodeTemplate {
  code: string;
}

export const ConfirmingCodeTemplate = (data: IConfirmingCodeTemplate) => {
  const { code } = data;
  return `<div>Код подтверждения ${code}</div>`;
};
