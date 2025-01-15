const { Role, RolePrivilege, User } = require('../db');

const checkPermission = (requiredPermission) => {
  return async (req, res, next) => {
    try {
      const userId = req.user.id;

      const user = await User.findByPk(userId, {
        include: {
          model: Role,
          as: 'Role',
          include: [
            {
              model: RolePrivilege,
              attributes: ['permission'], // Sadece izinleri getir
            },
          ],
        },
      });

      if (!user || !user.Role) {
        return res.status(403).json({
          error: 'Kullanıcı bulunamadı veya yetkili değil.',
        });
      }

      // Kullanıcının izinlerini kontrol et
      const userPermissions = user.Role.RolePrivileges.map(
        (privilege) => privilege.permission
      );

      
      
      if (!userPermissions.includes(requiredPermission)) {
        return res.status(403).json({
          error: 'Bu işlemi gerçekleştirmek için yeterli yetkiye sahip değilsiniz.',
        });
      }

      next();
    } catch (error) {
      console.error('Permission check error:', error);
      res.status(500).json({
        error: 'Yetki kontrolü sırasında bir hata oluştu.',
      });
    }
  };
};


module.exports = checkPermission;
