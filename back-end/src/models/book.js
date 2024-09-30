const { Model, DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  class Book extends Model {
    static associate(models) {
      Book.belongsTo(models.Publisher, {
        foreignKey: 'publisher_id'
      });
      Book.hasMany(models.Review, {
        foreignKey: 'book_id'
      });
      Book.belongsTo(models.Author, {
        foreignKey: 'author_id'
      });
      Book.belongsTo(models.Category, {
        foreignKey: 'category_id'
      });
      Book.hasMany(models.Collection_Book, {
        foreignKey: 'book_id'
      });
      Book.hasMany(models.Image, {
        foreignKey: 'book_id'
      });
      Book.belongsToMany(models.Genre, {
        through: models.Book_Genre,
        foreignKey: 'bookId',
        otherKey: 'genreId',
        as: 'genres'
      });
    }
   
  }

  Book.init({
    ISBN: DataTypes.STRING,
    title: DataTypes.STRING,
    desc: DataTypes.STRING,
    price: DataTypes.DECIMAL,
    salePrice: DataTypes.DECIMAL,
    year: DataTypes.DATE,
    stock: DataTypes.INTEGER,
    cover_img_url: DataTypes.STRING,
    publisher_id: {
      type: DataTypes.INTEGER,
      references: {
        model: 'Publishers',
        key: 'id'
      }
    },
    author_id: {
      type: DataTypes.INTEGER,
      references: {
        model: 'Authors',
        key: 'id'
      }
    },
    category_id: {
      type: DataTypes.INTEGER,
      references: {
        model: 'Categories',
        key: 'id'
      }
    }
  }, {
    sequelize,
    modelName: 'Book',
    timestamps: false
  });

  return Book;
};