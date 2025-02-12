import { Order } from "@prisma/client";

interface IOrderTemplate {
  order: Order
}

export const OrderTemplate = (data: IOrderTemplate) => {
  const { order } = data;
  return `<div>#${order.id}<br /><br />${order.info}<br /><br />Сумма: ${order.total}<br /><br /></div>`;
};
