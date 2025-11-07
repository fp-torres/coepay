

// // ATUALIZAR DADOS DO USUÁRIO
// app.put("/users/:id", async (req, res) => {
//   const { id } = req.params;
//   const { name, email, pix } = req.body;

//   try {
//     const result = await pool.query(
//       "UPDATE users SET name = $1, email = $2, pix = $3 WHERE id = $4 RETURNING id, name, email, pix",
//       [name, email, pix, id]
//     );

//     if (result.rows.length === 0) {
//       return res.status(404).json({ message: "Usuário não encontrado" });
//     }

//     res.json(result.rows[0]);
//   } catch (err) {
//     console.error("Erro ao atualizar usuário:", err);
//     res.status(500).json({ message: "Erro ao atualizar usuário" });
//   }
// });

// // Upload de comprovantes (até 2 arquivos)
// app.post("/upload-comprovante", upload.array('comprovantes', 2), async (req, res) => {
//   try {
//     if (!req.files || req.files.length === 0) {
//       return res.status(400).json({ message: "Nenhum arquivo enviado" });
//     }

//     const urls = req.files.map(file => `/uploads/${file.filename}`);
//     res.json({ urls });
//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ message: "Erro ao fazer upload dos comprovantes" });
//   }
// });


// // Rota para receber webhook de PSP
// app.post("/webhook/psp", async (req, res) => {
//   try {
//     // Exemplo de payload que o PSP pode enviar
//     // {
//     //   cobrancaId: "123",
//     //   pagoEm: "2025-09-30T15:00:00Z",
//     //   valorPago: 150.50
//     // }
//     const { cobrancaId, pagoEm } = req.body;

//     if (!cobrancaId) {
//       return res.status(400).json({ message: "ID da cobrança é obrigatório" });
//     }

//     // Atualiza a cobrança no banco
//     const result = await pool.query(
//       `UPDATE devedores 
//        SET pago = true, pago_em = $1, status = 'paga'
//        WHERE id = $2
//        RETURNING *`,
//       [pagoEm || new Date(), cobrancaId]
//     );

//     if (result.rows.length === 0) {
//       return res.status(404).json({ message: "Cobrança não encontrada" });
//     }

//     console.log(`Cobrança ${cobrancaId} marcada como paga via webhook`);
//     res.status(200).json({ message: "Cobrança atualizada com sucesso", cobranca: result.rows[0] });
//   } catch (err) {
//     console.error("Erro ao processar webhook do PSP:", err);
//     res.status(500).json({ message: "Erro ao atualizar cobrança" });
//   }
// });

