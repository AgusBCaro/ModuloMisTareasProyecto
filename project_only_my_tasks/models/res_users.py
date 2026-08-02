# -*- coding: utf-8 -*-
from odoo import models, fields

class ResUsers(models.Model):
    _inherit = 'res.users'

    only_my_tasks = fields.Boolean(
        string="Solo Mis tareas",
        default=False,
        help="Al activar esta opción, la vista del módulo de proyectos filtrará automáticamente únicamente las tareas asignadas a este usuario."
    )

    def action_toggle_only_my_tasks(self):
        """Método de acción para activar/desactivar 'Solo Mis tareas' desde el botón en Ajustes/Preferencias."""
        for user in self:
            user.only_my_tasks = not user.only_my_tasks
        return True
