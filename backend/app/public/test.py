import bpy
import os
import mathutils

def process_model(input_path, output_path):
    # 清除默认场景
    bpy.ops.object.select_all(action='SELECT')
    bpy.ops.object.delete()

    # 导入模型
    bpy.ops.import_scene.gltf(filepath=input_path)

    # 获取导入的模型
    model = bpy.context.selected_objects[0]

    # 分离网格
    bpy.context.view_layer.objects.active = model
    bpy.ops.object.mode_set(mode='EDIT')
    bpy.ops.mesh.select_all(action='SELECT')

    # 基于法线角度分离
    bpy.ops.mesh.edge_split(type='EDGE_ANGLE', angle_limit=0.523599) # 30度
    bpy.ops.object.mode_set(mode='OBJECT')

    # 分离松散部分
    bpy.ops.mesh.separate(type='LOOSE')

    # 导出处理后的模型
    bpy.ops.export_scene.gltf(
        filepath=output_path,
        export_format='GLB',
        export_draco_mesh_compression_enable=True
    )

if __name__ == "__main__":
    input_path = r"G:\GraduationDesign\probject\frontend\public\models\input\qiniandian.glb"
    output_path = r"G:\GraduationDesign\probject\frontend\public\models\qiniandian123.glb"
    process_model(input_path, output_path)