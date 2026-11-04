// Fuso e locale fixos: o HTML gerado no servidor e o renderizado no navegador
// precisam produzir exatamente o mesmo texto, senão o React acusa erro de hidratação.
const dateFormatter = new Intl.DateTimeFormat("pt-BR", {
  dateStyle: "short",
  timeStyle: "short",
  timeZone: "America/Sao_Paulo",
});

export function formatDate(timestamp: number) {
  return dateFormatter.format(timestamp);
}
