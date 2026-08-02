# -*- coding: utf-8 -*-
from odoo import models, fields, api

class ResUsers(models.Model):
    _inherit = 'res.users'

    only_my_tasks = fields.Boolean(
        string="Solo Mis tareas",
        default=False,
        help="Al activar esta opción, se ocultarán todas las vistas y menús del módulo de proyectos (Proyectos, Métricas, Configuración) excepto la vista de 'Mis Tareas'."
    )

    def _get_only_my_tasks_group(self):
        return (
            self.env.ref('ModuloMisTareasProyecto.group_project_only_my_tasks', raise_if_not_found=False) or
            self.env.ref('project_only_my_tasks.group_project_only_my_tasks', raise_if_not_found=False)
        )

    def _sync_only_my_tasks_group(self):
        """Sincroniza la pertenencia al grupo de seguridad según el campo only_my_tasks."""
        group = self._get_only_my_tasks_group()
        if group:
            for user in self:
                has_grp = group in user.groups_id
                if user.only_my_tasks and not has_grp:
                    group.sudo().write({'users': [(4, user.id)]})
                elif not user.only_my_tasks and has_grp:
                    group.sudo().write({'users': [(3, user.id)]})
        # Limpiar caché de menús
        self.env['ir.ui.menu'].clear_caches()

    @api.model_create_multi
    def create(self, vals_list):
        users = super(ResUsers, self).create(vals_list)
        users._sync_only_my_tasks_group()
        return users

    def write(self, vals):
        res = super(ResUsers, self).write(vals)
        if 'only_my_tasks' in vals or 'groups_id' in vals or 'in_group_' in str(vals):
            # Sincronizar bidireccionalmente: si el usuario pertenece al grupo pero only_my_tasks es False
            group = self._get_only_my_tasks_group()
            if group:
                for user in self:
                    has_grp = group in user.groups_id
                    if has_grp and not user.only_my_tasks:
                        super(ResUsers, user).write({'only_my_tasks': True})
                    elif not has_grp and user.only_my_tasks:
                        super(ResUsers, user).write({'only_my_tasks': False})
            self.env['ir.ui.menu'].clear_caches()
        return res

    def action_toggle_only_my_tasks(self):
        """Método de acción para activar/desactivar 'Solo Mis tareas' desde el botón en Ajustes/Preferencias."""
        for user in self:
            user.only_my_tasks = not user.only_my_tasks
        return True
