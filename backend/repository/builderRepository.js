import BuilderTemplate from "../models/builderTemplateModel.js";

class BuilderRepository {
  async create(data) {
    return await BuilderTemplate.create(data);
  }

  async findById(id) {
    return await BuilderTemplate.findById(id);
  }

  async findBySlug(slug) {
    return await BuilderTemplate.findOne({ slug });
  }

  async findPublishedBySlug(slug) {
    return await BuilderTemplate.findOne({ slug, status: "published" });
  }

  async findAll(filter = {}, sort = { updatedAt: -1 }, skip = 0, limit = 50) {
    const total = await BuilderTemplate.countDocuments(filter);
    const data = await BuilderTemplate.find(filter)
      .sort(sort)
      .skip(skip)
      .limit(limit)
      .populate("createdBy", "name email");
    return { data, total };
  }

  async update(id, data) {
    return await BuilderTemplate.findByIdAndUpdate(id, data, {
      new: true,
      runValidators: true,
    });
  }

  async delete(id) {
    return await BuilderTemplate.findByIdAndDelete(id);
  }

  async incrementViews(slug) {
    return await BuilderTemplate.findOneAndUpdate(
      { slug },
      { $inc: { viewsCount: 1 } },
      { new: true }
    );
  }

  async incrementLeads(id) {
    return await BuilderTemplate.findByIdAndUpdate(
      id,
      { $inc: { leadsCount: 1 } },
      { new: true }
    );
  }
}

export default new BuilderRepository();
