# -*- coding: utf-8 -*-
from odoo import models, api

class IrUiMenu(models.Model):
    _inherit = 'ir.ui.menu'

    @api.model
    def _filter_visible_menus(self):
        """
        Si el usuario actual tiene activada la opción 'only_my_tasks',
        se filtran los elementos de menú del módulo de Proyectos para que únicamente
        tenga acceso visual al menú de 'Mis Tareas' y se le oculten los demás
        (Proyectos generales, Configuración, Informes, etc.).
        """
        menus = super(IrUiMenu, self)._filter_visible_menus()
        user = self.env.user

        if getattr(user, 'only_my_tasks', False):
            # Obtener referencias a menús clave del módulo de proyectos
            project_root = self.env.ref('project.menu_main_pm', raise_if_not_found=False)
            my_tasks_menu = (
                self.env.ref('project.menu_project_management', raise_if_not_found=False) or
                self.env.ref('project.menu_action_subtask_completion', raise_if_not_found=False) or
                self.env.ref('project.menu_project_task_user_all', raise_if_not_found=False)
            )

            if project_root:
                # Construir el conjunto de IDs permitidos dentro del árbol de menú de proyectos (Mis Tareas y sus padres)
                allowed_ids = set()
                if my_tasks_menu:
                    curr = my_tasks_menu
                    while curr:
                        allowed_ids.add(curr.id)
                        curr = curr.parent_id

                # Buscar todos los submenús pertenecientes al árbol de Proyectos
                project_submenus = menus.filtered(
                    lambda m: m.id == project_root.id or (m.parent_path and str(project_root.id) in m.parent_path.split('/'))
                )

                # Identificar los menús que deben ocultarse
                menus_to_hide = project_submenus.filtered(
                    lambda m: m.id != project_root.id and m.id not in allowed_ids
                )

                menus = menus - menus_to_hide

        return menus
