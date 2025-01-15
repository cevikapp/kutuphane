const express = require('express');
const router = express.Router();
const { RolePrivilege, Role } = require('../db');
const Response = require('../lib/Response');


router.get('/:roleId/permissions', async (req, res) => {
    try {
      const { roleId } = req.params;
      const role = await Role.findByPk(roleId);
      if (!role) {
        return res.status(404).json(
          Response.errorResponse({
            message: 'Role not found',
            description: `No role found with ID ${roleId}.`,
          })
        );
      }

      const permissions = await RolePrivilege.findAll({
        where: { role_id: roleId },
        attributes: ['id', 'permission', 'created_by', 'created_at'], 
      });
  
      res.status(200).json(Response.successResponse(permissions));
    } catch (error) {
      console.log('Permission list error:', error);
      const errorResponse = Response.errorResponse(error);
      res.status(errorResponse.code).json(errorResponse);
    }
});

router.get('/permissions', async (req, res) => {
    try {
      // Tüm permission'ları getir
      const permissions = await RolePrivilege.findAll({
        attributes: ['id', 'role_id', 'permission', 'created_by', 'created_at'], 
        include: {
          model: require('../db').Role,
          attributes: ['id', 'name'], 
        },
      });
  
      res.status(200).json(Response.successResponse(permissions));
    } catch (error) {
      console.log('Permission list error:', error);
      const errorResponse = Response.errorResponse(error);
      res.status(errorResponse.code).json(errorResponse);
    }
  });

router.post('/permissions/add', async (req, res) => {
    try {
      const { role_id }= req.body;
      const { permissions, created_by } = req.body;
  
      // Role kontrolü
      const role = await Role.findByPk(role_id);
      if (!role) {
        return res.status(404).json(
          Response.errorResponse({
            message: 'Role not found',
            description: `No role found with ID ${role_id}.`,
          })
        );
      }

      const rolePrivileges = await Promise.all(
        permissions.map((permission) =>
          RolePrivilege.create({
            role_id,
            permission,
            created_by,
          })
        )
      );
  
      res.status(201).json(Response.successResponse(rolePrivileges));
    } catch (error) {
      console.log('Permission assign error:', error);
      const errorResponse = Response.errorResponse(error);
      res.status(errorResponse.code).json(errorResponse);
    }
});

router.patch('/:roleId/permissions/update', async (req, res) => {
    try {
      const { roleId } = req.params;
      const { permissions } = req.body;
  
      const role = await Role.findByPk(roleId);
      if (!role) {
        return res.status(404).json(
          Response.errorResponse({
            message: 'Role not found',
            description: `No role found with ID ${roleId}.`,
          })
        );
      }

      const updated = await RolePrivilege.update(
        { created_at: new Date() },
        {
          where: {
            role_id: roleId,
            permission: permissions,
          },
        }
      );
  
      res.status(200).json(
        Response.successResponse({
          message: `${updated} permissions updated.`,
        })
      );
    } catch (error) {
      console.log('Permission update error:', error);
      const errorResponse = Response.errorResponse(error);
      res.status(errorResponse.code).json(errorResponse);
    }
});
  
router.delete('/permissions/delete/:id', async (req, res) => {
    try {
        const { id } = req.params; 
        const permission = await RolePrivilege.findByPk(id);

        if (permission) {
            await permission.destroy();
            return res.json(Response.successResponse({
                message: `Permission with ID ${id} deleted.`,
            }));
        } else {
            return res.status(404).json(Response.errorResponse({
                code: 404,
                message: 'Permission not found',
                description: `No permission found with ID ${id}.`,
            }));
        }
    } catch (error) {
        console.error('Permission delete error:', error);
        const errorResponse = Response.errorResponse(error);
        if (!res.headersSent) { 
            res.status(errorResponse.code).json(errorResponse);
        }
    }
});




module.exports = router;