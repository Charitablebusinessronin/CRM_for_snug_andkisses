const { getSdk } = require("zcatalyst-sdk-node")

module.exports = async (context, basicIO) => {
  const catalyst = getSdk(context)
  const method = basicIO.getMethod()

  try {
    const datastore = catalyst.datastore()
    const appointmentsTable = datastore.table("Appointments")

    switch (method) {
      case "GET": {
        const appointments = await appointmentsTable.getRecords()
        const formattedAppointments = appointments.map((a) => ({ id: a.ROWID, ...a.Appointments }))
        basicIO.setStatus(200).send({ data: formattedAppointments })
        break
      }
      case "POST": {
        const appointmentData = basicIO.getRequestObject()
        const newAppointment = await appointmentsTable.insertRecord({ ...appointmentData })
        basicIO.setStatus(201).send({
          message: "Appointment created successfully",
          data: { id: newAppointment.ROWID, ...newAppointment.Appointments },
        })
        break
      }
      default:
        basicIO.setStatus(405).send({ error: "Method not allowed" })
    }
  } catch (err) {
    console.error("Error in /api/v1/appointments:", err)
    basicIO.setStatus(500).send({
      error: "Internal server error",
      details: err.message,
    })
  }
}
