// Helpers WhatsApp (R$0): gera links wa.me prontos, sem API paga.
export function onlyDigits(s: string) {
  return (s || '').replace(/\D/g, '');
}

export function waLink(phoneBR: string, message: string) {
  const phone = onlyDigits(phoneBR);
  return `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
}

export function confirmMessage(opts: {
  businessNome: string;
  clienteNome: string;
  quando: string;
  servico: string;
  confirmUrl: string;
  cancelUrl: string;
}) {
  return (
    `Olá ${opts.clienteNome}! Aqui é da ${opts.businessNome}. ` +
    `Lembrete: ${opts.servico} em ${opts.quando}. ` +
    `Confirma? SIM: ${opts.confirmUrl} NÃO: ${opts.cancelUrl}`
  );
}

export function reminderBatchMessage(nome: string, quando: string, servico: string) {
  return `Olá ${nome}! Passando para confirmar seu horário ${servico} em ${quando}. Pode confirmar aqui por favor? 🙏`;
}
