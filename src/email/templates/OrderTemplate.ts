import { Order, User } from '@prisma/client';

interface IOrderTemplate {
  order: Order;
  user: User;
}

export const OrderTemplate = (data: IOrderTemplate) => {
  const { order, user } = data;
  return `<div>#${order.id}<br /><br />${order.info.toString()}<br /><br />${user.toString()}<br /><br />Сумма: ${order.total}<br /><br /></div>`;
};
