{
    'name': 'Proyectos - Solo Mis Tareas',
    'version': '1.0.0',
    'category': 'Services/Project',
    'summary': 'Permite a los usuarios restringir la visualización de proyectos a solo sus tareas asignadas desde sus ajustes de usuario.',
    'description': """
Módulo de extensión de Proyectos para Odoo.
==========================================
Agrega un botón/campo en los Ajustes/Preferencias del Usuario denominado "Solo Mis tareas".
Al activarlo, se aplican reglas de registro (ir.rule) para que el usuario únicamente visualice las tareas donde esté asignado.
    """,
    'author': 'Antigravity AI',
    'depends': ['base', 'project'],
    'data': [
        'security/project_security.xml',
        'security/ir.model.access.csv',
        'views/res_users_views.xml',
    ],
    'installable': True,
    'application': False,
    'auto_install': False,
    'license': 'LGPL-3',
}
