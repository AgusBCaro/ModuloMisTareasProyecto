# -*- coding: utf-8 -*-
from odoo import models, fields, api

class ResUsers(models.Model):
    _inherit = 'res.users'

    only_my_tasks = fields.Boolean(
        string="Solo Mis tareas",
        default=False,
        help="Al activar esta opción, la vista del módulo de proyectos filtrará automáticamente únicamente las tareas asignadas a este usuario."
    )

    def _sync_only_my_tasks_group(self):
        """Sincroniza la pertenencia al grupo de seguridad según el campo only_my_tasks."""
        group_xmlid = 'ModuloMisTareasProyecto.group_project_only_my_tasks'
        group = self.env.ref(group_xmlid, raise_if_not_found=False)
        if not group:
            group = self.env.ref('project_only_my_tasks.group_project_only_my_tasks', raise_if_not_found=False)
        
        if group:
            for user in self:
                if user.only_my_tasks:
                    group.sudo().write({'users': [(4, user.id)]})
                else:
                    group.sudo().write({'users': [(3, user.id)]})

    @api.model_create_multi
    def create(self, vals_list):
        users = super(ResUsers, self).create(vals_list)
        users._sync_only_my_tasks_group()
        return users

    def write(self, vals):
        res = super(ResUsers, self).write(vals)
        if 'only_my_tasks' in vals:
            self._sync_only_my_tasks_group()
        return res

    def action_toggle_only_my_tasks(self):
        """Método de acción para activar/desactivar 'Solo Mis tareas' desde el botón en Ajustes/Preferencias."""
        for user in self:
            user.only_my_tasks = not user.only_my_tasks
        return True
