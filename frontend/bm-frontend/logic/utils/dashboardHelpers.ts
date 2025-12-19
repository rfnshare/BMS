// This helper helps us find the names based on the IDs we have
export const findNameById = (list: any[], id: number | string, fieldName: string = 'full_name') => {
  const item = list.find(i => i.id === Number(id));
  return item ? item[fieldName] : `ID: ${id}`;
};