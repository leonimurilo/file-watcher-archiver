const mongoose = require('mongoose');

const fileMetaSchema = new mongoose.Schema({
  path: { type: String, unique: true },
  name: String,
  passwordResetToken: String,
  creationDate: Date,
  modificationDate: Date,
  size: { type: Number, min: 0 },
  archived: { type: Boolean, default: false },
}, { timestamps: true });

const FileMeta = mongoose.model('FileMeta', fileMetaSchema);

module.exports = FileMeta;
