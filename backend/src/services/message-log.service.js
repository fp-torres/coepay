import { MessageLog } from "../models/initModels.js";

export const createMessageLog = async ({
  userId,
  channel,
  recipient,
  chargeId = null,
  customerName = null,
  subject = null,
  message,
  status,
  errorMessage = null,
}) =>
  MessageLog.create({
    user_id: userId,
    channel,
    recipient,
    charge_id: chargeId,
    customer_name: customerName,
    subject,
    message,
    status,
    error_message: errorMessage,
    sent_at: status === "sent" ? new Date() : null,
  });
