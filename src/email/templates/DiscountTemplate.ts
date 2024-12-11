interface IDiscountTemplate {
  discount: {
    id: number;
    email: string;
  };
}

export const DiscountTemplate = (data: IDiscountTemplate) => {
  const { discount } = data;
  return `<div>Рассылка: ${discount.email}</div>`;
};
