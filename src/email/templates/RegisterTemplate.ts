import { User } from "@prisma/client";

interface IRegisterTemplate {
  user: User
}

export const RegisterTemplate = (data: IRegisterTemplate) => {
  const { user } = data;
  const {id, ...props} = user
  return `<div>Зарегистрировался новый пользователь #${id}
    <div>${props.family} ${props.name} ${props.surname}</div>
    <div>Почта: ${props.email}</div>
    <div>Дата рождения: ${props.birthday}</div>
    <div>Регион: ${props.region}</div>
    <div>Номер: ${props.phone}</div>
    <div>Социальная сеть: ${props.social}</div>
  </div>`;
};
