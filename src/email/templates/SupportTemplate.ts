interface ISupportTemplate {
  support: {
    id?: number;
    createdAt?: Date;
    name?: string;
    phone?: string;
    messenger?: string;
    description?: string;
    userId?: number | null;
  };
}

export const SupportTemplate = (data: ISupportTemplate) => {
  const { support } = data;
  return `<div>${support.name}(${support.messenger}) с номером телефона ${support.phone} обратился со следующей проблемой:<br />${support.description}</div>`;
};
