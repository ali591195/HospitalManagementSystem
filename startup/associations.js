const PatientAllergyAssignment = require('../models/patientAllergyAssignment');
const StaffPatientAssignment = require('../models/staffPatientAssignment');
const DoctorNurseAssignment = require('../models/doctorNurseAssignment');
const StaffWardAssignment = require('../models/staffWardAssignment');

const Allergy = require('../models/allergy');
const Patient = require('../models/patient');
const Doctor = require('../models/doctor');
const Person = require('../models/person');
const Nurse = require('../models/nurse');
const Staff = require('../models/staff');
const Ward = require('../models/ward');

Allergy.belongsToMany(Patient, { through: PatientAllergyAssignment });
Patient.belongsToMany(Allergy, { through: PatientAllergyAssignment });
Patient.belongsToMany(Staff, { through: StaffPatientAssignment });
Staff.belongsToMany(Patient, { through: StaffPatientAssignment });
Doctor.belongsToMany(Nurse, { through: DoctorNurseAssignment });
Nurse.belongsToMany(Doctor, { through: DoctorNurseAssignment });
Staff.belongsToMany(Ward, { through: StaffWardAssignment });
Ward.belongsToMany(Staff, { through: StaffWardAssignment, as: 'assignedStaffs' });

Patient.belongsTo(Person);
Patient.belongsTo(Ward);
Staff.belongsTo(Person);
Doctor.belongsTo(Staff);
Person.hasOne(Patient);
Nurse.belongsTo(Staff);
Ward.hasMany(Patient);
Person.hasOne(Staff);
Staff.hasOne(Doctor);
Staff.hasOne(Nurse);

module.exports = {
    PatientAllergyAssignment,
    StaffPatientAssignment,
    DoctorNurseAssignment,
    StaffWardAssignment,
    Allergy,
    Patient,
    Doctor,
    Person,
    Nurse,
    Staff,
    Ward
}