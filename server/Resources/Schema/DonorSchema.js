// In your DB config file where donor schema is defined
module.exports = (sequelize, DataTypes) => {
    const DonorSchema = sequelize.define("donor", {
        ID: {
            primaryKey: true,
            autoIncrement: true,
            type: DataTypes.INTEGER,
            unique: true,
            allowNull: false,
        },
        Country: {
            type: DataTypes.STRING,
            allowNull: true,
        },
        DonarOrganisation: {
            type: DataTypes.STRING,
            allowNull: true,
            unique: true, // Organisation name should be unique
        },
        Mobile: {
            type: DataTypes.STRING,
            allowNull: true,
        },
        Email: {
            type: DataTypes.STRING,
            allowNull: true,
        },
        Website: {
            type: DataTypes.STRING,
            allowNull: true,
            unique: true, // Website should be unique
        },
        Logo: {
            type: DataTypes.STRING,
            allowNull: true,
            comment: 'Path to donor logo/image (e.g., /files/donor-logos/filename.jpg)'
        },
        DonorDevice: {
            type: DataTypes.INTEGER,
            allowNull: false,
            defaultValue: 0,
            comment: 'Number of devices associated with this donor'
        }
    },
    {
        tableName: 'donor',
        timestamps: false, // Set to true if you want createdAt/updatedAt
      
    });
    
    return DonorSchema;
};