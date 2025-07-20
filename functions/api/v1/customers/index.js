const { getSdk } = require("zcatalyst-sdk-node")

module.exports = async (context, basicIO) => {
  const catalyst = getSdk(context)
  const method = basicIO.getMethod()

  try {
    const datastore = catalyst.datastore()
    const customersTable = datastore.table("Customers")

    switch (method) {
      case "GET": {
        const customers = await customersTable.getRecords()
        const formattedCustomers = customers.map((c) => ({ id: c.ROWID, ...c.Customers }))
        basicIO.setStatus(200).send({ data: formattedCustomers })
        break
      }
      case "POST": {
        const customerData = basicIO.getRequestObject()
        const newCustomer = await customersTable.insertRecord({ ...customerData })
        basicIO.setStatus(201).send({
          message: "Customer created successfully",
          data: { id: newCustomer.ROWID, ...newCustomer.Customers },
        })
        break
      }
      default:
        basicIO.setStatus(405).send({ error: "Method not allowed" })
    }
  } catch (err) {
    console.error("Error in /api/v1/customers:", err)
    basicIO.setStatus(500).send({
      error: "Internal server error",
      details: err.message,
    })
  }
}
