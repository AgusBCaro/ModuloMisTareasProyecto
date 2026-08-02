# -*- coding: utf-8 -*-
from odoo import models, fields, api

class ResUsers(models.Model):
    _inherit = 'res.users'

    only_my_tasks = fields.Boolean(
        string="Solo Mis tareas",
        default=False,
        help="Al activar esta opción, la vista del módulo de proyectos filtrará automáticamente únicamente las tareas asignadas a este usuario."
    )

    def action_toggle_only_my_tasks(self):
        """Método de acción para activar/desactivar 'Solo Mis tareas' directamente desde un botón en Preferencias/Ajustes."""
        for user in self:
            user.only_my_tasks = not user.only_my_tasks
        return True

    @api.model
    def __init__(self, pool, cr):
        super(ResUsers, self).__init__(pool, cr)

    # Exponer la preferencia en las vistas self-service de preferencias si es necesario
    def __init_user_preferences__(self):
        res = super(ResUsers, self).__init_user_preferences__()
        return res
