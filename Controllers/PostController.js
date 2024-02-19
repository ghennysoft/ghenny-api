
export const    getPosts = async (req, res) => {
    try {
        res.status(200).json('Getting Posts')
    } catch (error) {
        res.status(500).json(error)
    }
}
