const Category = require('../models/Category');

// Get all categories
exports.getCategories = async (req, res) => {
    try {
        const categories = await Category.find().sort({ isDefault: -1, name: 1 });
        res.json(categories);
    } catch (error) {
        console.error('Get categories error:', error);
        res.status(500).json({ message: 'Error al obtener categorías' });
    }
};

// Create new category
exports.createCategory = async (req, res) => {
    try {
        const { name } = req.body;
        console.log('Creating category:', name);

        if (!name || !name.trim()) {
            return res.status(400).json({ message: 'Nombre de categoría requerido' });
        }

        // Generate slug
        const slug = name
            .toLowerCase()
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '')
            .replace(/\s+/g, '_')
            .replace(/[^a-z0-9_]/g, '');

        console.log('Generated slug:', slug);

        // Use findOneAndUpdate with upsert - atomic operation, no race conditions
        const category = await Category.findOneAndUpdate(
            { slug: slug },
            {
                $setOnInsert: {
                    name: name.trim(),
                    slug: slug,
                    isDefault: false,
                    createdAt: new Date()
                }
            },
            {
                upsert: true,
                new: true,
                runValidators: true
            }
        );

        console.log('Category result:', category);
        res.status(201).json({ category, message: 'Categoría creada' });
    } catch (error) {
        console.error('Create category error:', error.message, error.stack);
        res.status(500).json({ message: 'Error al crear categoría', error: error.message });
    }
};



// Delete category (admin only)
exports.deleteCategory = async (req, res) => {
    try {
        const { id } = req.params;
        const category = await Category.findById(id);

        if (!category) {
            return res.status(404).json({ message: 'Categoría no encontrada' });
        }

        if (category.isDefault) {
            return res.status(400).json({ message: 'No se pueden eliminar categorías predeterminadas' });
        }

        await Category.findByIdAndDelete(id);
        res.json({ message: 'Categoría eliminada' });
    } catch (error) {
        console.error('Delete category error:', error);
        res.status(500).json({ message: 'Error al eliminar categoría' });
    }
};

// Initialize default categories
exports.initDefaultCategories = async () => {
    const defaults = [
        { name: 'Infografía', slug: 'infografia', isDefault: true },
        { name: 'Líneas de tiempo', slug: 'lineas_tiempo', isDefault: true },
        { name: 'Carátulas', slug: 'caratulas', isDefault: true },
        { name: 'Manualidades', slug: 'manualidades', isDefault: true },
        { name: 'Separadores', slug: 'separadores', isDefault: true },
        { name: 'Mapas mentales', slug: 'mapas_mentales', isDefault: true },
    ];

    for (const cat of defaults) {
        await Category.findOneAndUpdate(
            { slug: cat.slug },
            cat,
            { upsert: true, new: true }
        );
    }
    console.log('Default categories initialized');
};
