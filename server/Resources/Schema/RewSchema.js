module.exports = (sequelize, DataTypes) => {
    const Rew = sequelize.define("rew", {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
            allowNull: false,
        },
        rew_name: {
            type: DataTypes.STRING(150),
            allowNull: false,
        },
        rew_phone: {
            type: DataTypes.STRING(20),
            allowNull: true,
        },
        rew_photos: {
            type: DataTypes.JSON,
            allowNull: true,
            comment: "Array of photo paths"
        },
        created_at: {
            type: DataTypes.DATE,
            defaultValue: DataTypes.NOW,
        },
        updated_at: {
            type: DataTypes.DATE,
            defaultValue: DataTypes.NOW,
            onUpdate: DataTypes.NOW,
        }
    }, {
        tableName: 'rew',
        timestamps: true,
        createdAt: 'created_at',
        updatedAt: 'updated_at',
    });

    return Rew;
};