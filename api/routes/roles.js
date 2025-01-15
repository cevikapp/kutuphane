const express = require('express');
const router = express.Router();
const { Role, AuditLog } = require('../db');
const Response = require('../lib/Response');
const authenticateToken = require('../middlewares/authMiddleware');


router.post('/add', authenticateToken, async (req, res) => {
  try {
    const newRole = await Role.create(req.body);
    const {id, name, description} = req.body;
    const logDetails = {
      action: "Add Role",
      details: JSON.stringify({id, name, description}),
      performed_by: req.user.id,
      timestamp: new Date(),
    }
    await AuditLog.create(logDetails);
    res.json(Response.successResponse(newRole));
  } catch (error) {
    let errorResponse = Response.errorResponse(error);
    res.status(errorResponse.code).json(errorResponse);
  }
});

router.get('/', async (req, res) => {
  try {
    const roles = await Role.findAll();
    res.json(Response.successResponse(roles));
  } catch (error) {
    let errorResponse = Response.errorResponse(error);
    res.status(errorResponse.code).json(errorResponse);
  }
});

router.get('/:id', async (req, res) => {
    try {
        const role = await Role.findByPk(req.params.id);
        res.json(Response.successResponse(role));
    } catch (error) {
        let errorResponse = Response.errorResponse(error);
        res.status(errorResponse.code).json(errorResponse);
    }
});


router.patch('/update/:id', authenticateToken, async (req, res) => {
    try {
        const role = await Role.findByPk(req.params.id);
        if (role) {
            await role.update(req.body);
            res.json(Response.successResponse(role));
        } else {
            throw new Error('Role not found');
        }

        const { name, is_active, description } = req.body;
        const logDetails = {
          action: 'Update Role',
          details: JSON.stringify({name, is_active, description }),
          performed_by: req.user.id, 
          timestamp: new Date(),
        };
        await AuditLog.create(logDetails);
    } catch (error) {
        let errorResponse = Response.errorResponse(error);
        res.status(errorResponse.code).json(errorResponse);
    }
});

router.delete('/delete/:id', authenticateToken, async (req, res) => {
    try {
        const role = await Role.findByPk(req.params.id);
        if (role) {
            await role.destroy();
            const { name, is_active, description } = role;
            const logDetails = {
              action: 'Delete Role',
              details: JSON.stringify({name, is_active, description }),
              performed_by: req.user.id, 
              timestamp: new Date(),
            };
            await AuditLog.create(logDetails);
            res.json(Response.successResponse(role));
        } else {
            throw new Error('Role not found');
        }
    } catch (error) {
        let errorResponse = Response.errorResponse(error);
        res.status(errorResponse.code).json(errorResponse);
    }
});

router.post('/:roleId/permissions', async (req, res) => {
    try {
      const { roleId } = req.params;
      const { permissions, created_by } = req.body; 

      const role = await Role.findByPk(roleId);
      if (!role) {
        return res.status(404).json(
          Response.errorResponse({
            message: 'Role not found',
            description: `No role found with ID ${roleId}.`,
          })
        );
      }
  
      const rolePrivileges = await Promise.all(
        permissions.map((permission) =>
          RolePrivilege.create({
            role_id: roleId,
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
  
router.delete('/:roleId/permissions', async (req, res) => {
    try {
      const { roleId } = req.params;
      const { permissions } = req.body;
  
      // Role kontrolü
      const role = await Role.findByPk(roleId);
      if (!role) {
        return res.status(404).json(
          Response.errorResponse({
            message: 'Role not found',
            description: `No role found with ID ${roleId}.`,
          })
        );
      }
  
      const deleted = await RolePrivilege.destroy({
        where: {
          role_id: roleId,
          permission: permissions,
        },
      });
  
      res.status(200).json(
        Response.successResponse({
          message: `${deleted} permissions deleted.`,
        })
      );
    } catch (error) {
      console.log('Permission delete error:', error);
      const errorResponse = Response.errorResponse(error);
      res.status(errorResponse.code).json(errorResponse);
    }
  });


module.exports = router;