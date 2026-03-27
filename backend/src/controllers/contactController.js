const Contact = require('../models/Contact');

exports.submitContact = async (req, res) => {
  try {
    const { name, email, message } = req.body;
    if (!name || !email || !message) {
      return res.status(400).json({ message: 'All fields are required.' });
    }
    const newContact = new Contact({ name, email, message });
    await newContact.save();
    return res.status(201).json({ message: 'Contact request submitted successfully.', contact: newContact });
  } catch (error) {
    console.error('Error submitting contact:', error);
    return res.status(500).json({ message: 'Server error while submitting contact request.' });
  }
};

exports.getContacts = async (req, res) => {
  try {
    const contacts = await Contact.find().sort({ createdAt: -1 });
    return res.status(200).json(contacts);
  } catch (error) {
    console.error('Error fetching contacts:', error);
    return res.status(500).json({ message: 'Server error while fetching contacts.' });
  }
};

exports.updateContactStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    
    if (!['pending', 'resolved'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status value.' });
    }
    
    const contact = await Contact.findByIdAndUpdate(
      id,
      { status },
      { new: true }
    );
    
    if (!contact) {
      return res.status(404).json({ message: 'Contact request not found.' });
    }
    
    return res.status(200).json({ message: 'Status updated successfully.', contact });
  } catch (error) {
    console.error('Error updating contact status:', error);
    return res.status(500).json({ message: 'Server error while updating status.' });
  }
};
