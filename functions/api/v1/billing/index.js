const { getSdk } = require("zcatalyst-sdk-node")

module.exports = async (context, basicIO) => {
  const catalyst = getSdk(context)
  const method = basicIO.getMethod()

  try {
    const datastore = catalyst.datastore()
    const billingTable = datastore.table("Invoices")

    switch (method) {
      case "GET": {
        const invoices = await billingTable.getRecords()
        const formattedInvoices = invoices.map((i) => ({ id: i.ROWID, ...i.Invoices }))
        basicIO.setStatus(200).send({ data: formattedInvoices })
        break
      }
      case "POST": {
        const invoiceData = basicIO.getRequestObject()
        const newInvoice = await billingTable.insertRecord({ ...invoiceData })
        basicIO.setStatus(201).send({
          message: "Invoice created successfully",
          data: { id: newInvoice.ROWID, ...newInvoice.Invoices },
        })
        break
      }
      default:
        basicIO.setStatus(405).send({ error: "Method not allowed" })
    }
  } catch (err) {
    console.error("Error in /api/v1/billing:", err)
    basicIO.setStatus(500).send({
      error: "Internal server error",
      details: err.message,
    })
  }
}
