# -*- coding: utf-8 -*-
from odoo import models, api

class IrUiMenu(models.Model):
    _inherit = 'ir.ui.menu'

    def _is_user_restricted(self):
        """Verifica si el usuario actual tiene activa la restricción 'Solo Mis Tareas'"""
        user = self.env.user
        if getattr(user, 'only_my_tasks', False):
            return True
        if user.has_group('ModuloMisTareasProyecto.group_project_only_my_tasks'):
            return True
        if user.has_group('project_only_my_tasks.group_project_only_my_tasks'):
            return True
        return False

    def _is_my_tasks_menu(self, menu):
        """Identifica si un registro de menú o diccionario corresponde a 'Mis Tareas'"""
        # 1. Comprobar XML ID
        xml_id = menu.get_external_id().get(menu.id, '') if hasattr(menu, 'get_external_id') else ''
        my_tasks_xml_ids = [
            'project.menu_project_management',
            'project.menu_action_subtask_completion',
            'project.menu_project_task_user_all',
            'project.act_project_project_2_project_task_all',
            'project.menu_tasks_config',
        ]
        if xml_id in my_tasks_xml_ids:
            return True

        # 2. Comprobar por Nombre
        name_lower = (menu.name or '').strip().lower()
        if 'mis tareas' in name_lower or 'my tasks' in name_lower:
            return True

        return False

    def _filter_project_menus_recordset(self, menus):
        """Filtra un recordset de ir.ui.menu reteniendo solo 'Mis Tareas' bajo el menú de Proyectos"""
        if not self._is_user_restricted():
            return menus

        # Buscar el menú raíz de Proyectos
        project_root = self.env.ref('project.menu_main_pm', raise_if_not_found=False)
        if not project_root:
            project_root = menus.filtered(
                lambda m: not m.parent_id and m.name and m.name.lower() in ['proyecto', 'proyectos', 'project', 'projects']
            )
            if project_root:
                project_root = project_root[0]

        if not project_root:
            return menus

        # Obtener todos los menús pertenecientes al módulo de proyectos
        project_submenus = menus.filtered(
            lambda m: m.id == project_root.id or (m.parent_path and str(project_root.id) in m.parent_path.split('/'))
        )

        if not project_submenus:
            return menus

        # Identificar el menú "Mis Tareas" y sus ancestros permitidos
        my_tasks_menus = project_submenus.filtered(lambda m: self._is_my_tasks_menu(m))

        allowed_ids = set()
        for m in my_tasks_menus:
            curr = m
            while curr:
                allowed_ids.add(curr.id)
                curr = curr.parent_id

        # Menús a ocultar: todos los submenús de Proyectos excepto los autorizados
        menus_to_hide = project_submenus.filtered(
            lambda m: m.id != project_root.id and m.id not in allowed_ids
        )

        return menus - menus_to_hide

    @api.model
    def _filter_visible_menus(self):
        menus = super(IrUiMenu, self)._filter_visible_menus()
        return self._filter_project_menus_recordset(menus)

    @api.model
    def load_web_menus(self, debug=False):
        """Sobrescribir el cargador de menús del cliente web en Odoo 16/17/18"""
        res = super(IrUiMenu, self).load_web_menus(debug)
        if not self._is_user_restricted() or not isinstance(res, dict):
            return res

        # Buscar la raíz de Proyectos
        project_root_id = None
        project_root = self.env.ref('project.menu_main_pm', raise_if_not_found=False)
        if project_root and project_root.id in res:
            project_root_id = project_root.id
        else:
            for m_id, m_data in res.items():
                if isinstance(m_data, dict) and m_data.get('name', '').lower() in ['proyecto', 'proyectos', 'project', 'projects']:
                    if not m_data.get('parent_id'):
                        project_root_id = m_data.get('id') or m_id
                        break

        if not project_root_id or project_root_id not in res:
            return res

        # Encontrar el ID del menú "Mis Tareas"
        my_tasks_id = None
        for m_id, m_data in res.items():
            if isinstance(m_data, dict):
                name = m_data.get('name', '').lower()
                xmlid = m_data.get('xmlid', '')
                if 'mis tareas' in name or 'my tasks' in name or 'my_task' in xmlid:
                    my_tasks_id = m_data.get('id') or m_id
                    break

        # Eliminar del dict de menús los submenús de proyectos que no sean "Mis Tareas"
        keys_to_remove = []
        for m_id, m_data in res.items():
            if isinstance(m_data, dict) and m_id != project_root_id:
                parent_id = m_data.get('parent_id')
                if parent_id == project_root_id:
                    if str(m_id) != str(my_tasks_id) and m_id != my_tasks_id:
                        keys_to_remove.append(m_id)
                        # También eliminar sus hijos
                        if 'childrenTree' in m_data:
                            keys_to_remove.extend([c.get('id') for c in m_data['childrenTree'] if isinstance(c, dict)])

        for k in keys_to_remove:
            res.pop(k, None)

        # Redirigir la acción principal del menú raíz directamente a "Mis Tareas"
        if project_root_id in res and isinstance(res[project_root_id], dict):
            if my_tasks_id and my_tasks_id in res:
                target_action = res[my_tasks_id].get('actionID') or res[my_tasks_id].get('action') or res[my_tasks_id].get('action_id')
                if target_action:
                    if 'actionID' in res[project_root_id]:
                        res[project_root_id]['actionID'] = target_action
                    if 'action' in res[project_root_id]:
                        res[project_root_id]['action'] = target_action
                    if 'action_id' in res[project_root_id]:
                        res[project_root_id]['action_id'] = target_action
                if 'children' in res[project_root_id]:
                    res[project_root_id]['children'] = [my_tasks_id]
                if 'childrenTree' in res[project_root_id]:
                    res[project_root_id]['childrenTree'] = [res[my_tasks_id]]

        return res
