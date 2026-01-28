export const formatDate = (date: string | Date) => {
  return new Date(date as string).toLocaleDateString('pt-BR')
}

export const createdAtText = (date: Date) => {
  return `Adicionado em ${formatDate(date)}`
}
