import React, { useState } from 'react';
import { uploadImage } from '../api/user'; // 你提供的上传图片的 API 函数

const AvatarUpload = () => {
    let [avatar, setAvatar] = useState(null); // 存储当前显示的头像
    const [file, setFile] = useState(null); // 存储上传的文件
    const [loading, setLoading] = useState(false); // 上传状态
    const [error, setError] = useState(null); // 错误信息


    if (localStorage.getItem('avatar_url')){
        avatar = localStorage.getItem('avatar_url')
    }

    // avatar = localStorage.getItem('avatar_url')
    // 处理文件选择
    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setFile(file);
        }

    };

    // 处理头像上传
    const handleUpload = async () => {
        if (!file) {
            alert("Please select an image to upload.");
            return;
        }

        const formData = new FormData();
        formData.append('avatar', file);

        setLoading(true);
        try {
            const response = await uploadImage(formData);
            console.log(response)
            // 后端返回的结构应该是 response.data.avatar_url
            if (response.data && response.data.avatar_url) {
                setAvatar(response.data.avatar_url); // 更新头像
                alert('Avatar uploaded successfully!');
            } else {
                throw new Error('No avatar URL returned from server.');
            }
        } catch (err) {
            setError('Error uploading image: ' + err.message);
            alert('Failed to upload avatar.');
        } finally {
            setLoading(false);
        }
    };

    // 渲染头像上传和显示界面
    return (
        <div>
            <h2>Upload Avatar</h2>
            <input
                type="file"
                accept="image/*"
                onChange={handleFileChange}
            />
            <button onClick={handleUpload} disabled={loading}>
                {loading ? 'Uploading...' : 'Upload Avatar'}
            </button>

            {error && <div style={{ color: 'red' }}>{error}</div>}

            {avatar && (
                <div>
                    <h3>Uploaded Avatar:</h3>
                    <img
                        src={avatar}
                        alt="User Avatar"
                        style={{ width: 100, height: 100, borderRadius: '50%' }}
                    />
                </div>
            )}
        </div>
    );
};

export default AvatarUpload;
