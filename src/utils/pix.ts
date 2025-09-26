import QRCode from 'qrcode';


// Gera um campo EMV (id, valor)
const emv = (id: string, value: string): string => {
  const size = value.length.toString().padStart(2, '0');
  return `${id}${size}${value}`;
};

// Gera o QR Code PIX no padrão EMVCo manual
export const gerarQRCodePIXManual = async (chave: string, valor: number, nome: string): Promise<string> => {
  const merchantAccountInfo = emv('00', 'BR.GOV.BCB.PIX') +
                              emv('01', chave);

  const payloadSemCRC = emv('00', '01') +
                        emv('26', merchantAccountInfo) +
                        emv('52', '0000') +
                        emv('53', '986') +
                        emv('54', valor.toFixed(2)) +
                        emv('58', 'BR') +
                        emv('59', nome.substring(0, 25).toUpperCase()) +
                        emv('60', 'SAO PAULO') +
                        emv('62', emv('05', '***')) +
                        '6304';

  const crc16 = (str: string): string => {
    let crc = 0xFFFF;
    for (let i = 0; i < str.length; i++) {
      crc ^= str.charCodeAt(i) << 8;
      for (let j = 0; j < 8; j++) {
        if ((crc & 0x8000) !== 0) {
          crc = (crc << 1) ^ 0x1021;
        } else {
          crc <<= 1;
        }
        crc &= 0xFFFF;
      }
    }
    return crc.toString(16).toUpperCase().padStart(4, '0');
  };

  const fullPayload = payloadSemCRC + crc16(payloadSemCRC);
  return await QRCode.toDataURL(fullPayload);
};
