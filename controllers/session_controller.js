const Session = require("../models/session_model");
const Invoice = require("../models/invoice_model");

exports.findAll = async (req, res) => {
  try {
    const session = await Session.find()
    .populate('idCoach')
    .populate('idCoachee');
    

    return res.status(200).json(session);
  } catch (error) {
    return res.status(400).json({ message: error.message });
  }
};

exports.getOne = async (req, res) => {
  try {
    const project = await Session.findOne({ _id: req.params.id });
    if (!project) {
      return res.status(404).json({ message: "Session non trouvé" });
    }

    return res.status(200).json(project);
  } catch (error) {
    return res.status(400).json({ message: error.message });
  }
};

exports.create = async (req, res) => {
  try {
    // code ici
    const newSession = new Session(req.body);
    const savedCoaching = await newSession.save();
    return res.status(201).json(savedCoaching);
  } catch (error) {
    return res.status(400).json({ message: error.message });
  }
};


exports.update = async (req, res) => {
  try {
    // vérifier si le projet existe
    const foundCoaching = await Session.findOne({ _id: req.params.id });
    if (!foundCoaching) {
      return res.status(404).json({ message: "Session non trouvé" });
    }

    const updatedProject = await Session.findOneAndUpdate(
      { _id: foundCoaching._id },
      { ...req.body },
      { new: true }
    );

    return res.status(200).json({
      message: "Session mis à jour avec succès",
      updatedData: updatedProject,
    });
  } catch (error) {
    return res.status(400).json({ message: error.message });
  }
};

exports.remove = async (req, res) => {
  try {
    // code ici
    const foundCoaching = await Session.findOne({ _id: req.params.id });
    if (!foundCoaching) {
      return res.status(404).json({ error: "Session non trouvé !" });
    }
    const deletedProject = await Session.findOneAndDelete({ _id: foundCoaching._id });
    return res.json({
      message: "Session supprimé avec succès",
      deletedData: deletedProject,
    });
  } catch (error) {
    return res
      .status(500)
      .json({ error: "Session non supprimé !", details: error.message });
  }
};

// Get all sessions that are not in any invoice
exports.getSessionsNotInAnyInvoice = async (req, res) => {
  try {
    // Find all session IDs that are referenced in invoices
    const invoices = await Invoice.find().select('sessions');
    const sessionIdsInInvoices = invoices.flatMap(invoice => invoice.sessions);

    // Find all sessions that are not in the sessionIdsInInvoices
    const sessionsNotInInvoices = await Session.find({ _id: { $nin: sessionIdsInInvoices } });

    res.status(200).json(sessionsNotInInvoices);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching sessions', error: error.message });
  }
};

exports.fetchSessionsByCoacheeId = async (req, res) => {
    const { coacheeId } = req.params; // Extract coacheeId from request parameters

    try {
        const sessions = await Session.find({ idCoachee: coacheeId }); // Fetch sessions where idCoachee contains the given id
        return res.status(200).json(sessions); // Return the fetched sessions
    } catch (error) {
        return res.status(500).json({ message: "Error fetching sessions", error });
    }
}
