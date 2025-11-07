const { ObjectId } = require("mongodb");
class ContactService {
    constructor(client) {
        this.Contact = client.db().collection("contacts");
    }

    /**
     * Trích xuất dữ liệu liên hệ từ payload.
     */
    extractContactData(payload) {
        const contact = {
            name: payload.name,
            email: payload.email,
            address: payload.address,
            phone: payload.phone,
            favorite: payload.favorite,
        };

        // Loại bỏ các trường không xác định (undefined)
        Object.keys(contact).forEach(
            (key) => contact[key] === undefined && delete contact[key]
        );
        return contact;
    }

    /**
     * Tạo một liên hệ mới.
     */
    async create(payload) {
        const contact = this.extractContactData(payload);
        const result = await this.Contact.findOneAndUpdate(
            contact,
            { $set: { favorite: contact.favorite === true } },
            { returnDocument: "after", upsert: true }
        );
        return result;
    }

    /**
     * Tìm kiếm liên hệ dựa trên bộ lọc.
     */
    async find(filter) {
        const cursor = await this.Contact.find(filter);
        return await cursor.toArray();
    }

    /**
     * Tìm kiếm liên hệ dựa trên tên.
     */
    async findByName(name) {
        return await this.find({
            name: { $regex: new RegExp(name), $options: "i" },
        });
    }

    /**
     * Tìm một liên hệ bằng ID.
     */
    async findById(id) {
        return await this.Contact.findOne({
            _id: ObjectId.isValid(id) ? new ObjectId(id) : null,
        });
    }

    /**
     * Cập nhật một liên hệ.
     */
    async update(id, payload) {
        const filter = {
            _id: ObjectId.isValid(id) ? new ObjectId(id) : null,
        };
        const update = this.extractContactData(payload);
        const result = await this.Contact.findOneAndUpdate(
            filter,
            { $set: update },
            { returnDocument: "after" }
        );
        return result;
    }

    /**
     * Xóa một liên hệ.
     */
    async delete(id) {
        const result = await this.Contact.findOneAndDelete({
            _id: ObjectId.isValid(id) ? new ObjectId(id) : null,
        });
        return result;
    }

    /**
     * Tìm tất cả liên hệ yêu thích.
     */
    async findFavorite() {
        return await this.find({ favorite: true });
    }

    /**
     * Xóa tất cả các liên hệ.
     */
    async deleteAll() {
        const result = await this.Contact.deleteMany({});
        return result.deletedCount;
    }
}

module.exports = ContactService;