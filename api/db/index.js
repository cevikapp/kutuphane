const sequelize = require('./Database');
const UserModel = require('./models/Users');
const CategoryModel = require('./models/Categories');
const BookModel = require('./models/Books');
const RoleModel = require('./models/Roles');
const RolePrivilegeModel = require('./models/RolePrivileges');
const LoanModel = require('./models/Loans');
const ReportModel = require('./models/Reports');
const AuditLogModel = require('./models/AuditLogs');

const User = UserModel(sequelize.connection);
const Category = CategoryModel(sequelize.connection);
const Book = BookModel(sequelize.connection);
const Role = RoleModel(sequelize.connection);
const RolePrivilege = RolePrivilegeModel(sequelize.connection);
const Loan = LoanModel(sequelize.connection);
const Report = ReportModel(sequelize.connection);
const AuditLog = AuditLogModel(sequelize.connection);

// İlişkiler
Loan.belongsTo(Book, { foreignKey: 'book_id'}); // Loan -> Book ilişkisi
Loan.belongsTo(User, { foreignKey: 'loaner'}); // Loan -> User (loaner)
Loan.belongsTo(User, { foreignKey: 'lender'}); // Loan -> User (lender)

// User ve Role arasında many-to-many ilişki
User.belongsTo(Role, {
  foreignKey: 'role_id', // User tablosunda role_id sütunu
  as: 'Role' // İlişki adı
});

Role.hasMany(User, {
  foreignKey: 'role_id', // Role tablosundaki User ile ilişki
  as: 'Users' // İlişki adı
});

// Role ve RolePrivilege arasında one-to-many ilişki
Role.hasMany(RolePrivilege, {
  foreignKey: 'role_id',
});

RolePrivilege.belongsTo(Role, {
  foreignKey: 'role_id',
});


// AuditLog modelinde User ile ilişkiyi belirtin
AuditLog.belongsTo(User, { foreignKey: 'performed_by', as: 'user' });
// User modelinde AuditLog ile ilişkiyi belirtin
User.hasMany(AuditLog, { foreignKey: 'performed_by', as: 'user' });


sequelize.connection.sync({ alter: true })
  .then(() => console.log('Veritabanı senkronize edildi.'))
  .catch(err => console.error('Veritabanı senkronizasyon hatası:', err));

module.exports = {
  sequelize: sequelize.connection,
  User,
  Category,
  Book,
  Role,
  RolePrivilege,
  Loan,
  Report,
  AuditLog
};
