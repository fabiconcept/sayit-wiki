import Like from '../db/models/Like';
import Note from '../db/models/Note';
import Comment from '../db/models/Comment';
import mongoose from 'mongoose';

export class LikeService {
    /**
     * Toggle like on a note or comment
     * Returns the new like status and count
     */
    static async toggleLike(
        userId: string,
        targetId: string,
        targetType: 'note' | 'comment'
    ): Promise<{ isLiked: boolean; likesCount: number }> {
        const session = await mongoose.startSession();
        session.startTransaction();
        
        try {
            const targetObjectId = new mongoose.Types.ObjectId(targetId);
            
            // Check if already liked
            const existingLike = await Like.findOne({
                userId,
                targetId: targetObjectId,
                targetType,
            }).session(session);
            
            let isLiked: boolean;
            let likesCount: number;
            
            if (existingLike) {
                // Unlike: Remove like and decrement count
                await Like.deleteOne({
                    userId,
                    targetId: targetObjectId,
                    targetType,
                }).session(session);
                
                const updated = targetType === 'note'
                    ? await Note.findByIdAndUpdate(
                        targetObjectId,
                        { $inc: { likesCount: -1 } },
                        { new: true, session }
                    )
                    : await Comment.findByIdAndUpdate(
                        targetObjectId,
                        { $inc: { likesCount: -1 } },
                        { new: true, session }
                    );
                
                if (!updated) {
                    throw new Error(`${targetType} not found`);
                }
                
                isLiked = false;
                likesCount = Math.max(0, updated.likesCount);
            } else {
                // Like: Create like and increment count
                await Like.create(
                    [{
                        userId,
                        targetId: targetObjectId,
                        targetType,
                    }],
                    { session }
                );
                
                const updated = targetType === 'note'
                    ? await Note.findByIdAndUpdate(
                        targetObjectId,
                        { $inc: { likesCount: 1 } },
                        { new: true, session }
                    )
                    : await Comment.findByIdAndUpdate(
                        targetObjectId,
                        { $inc: { likesCount: 1 } },
                        { new: true, session }
                    );
                
                if (!updated) {
                    throw new Error(`${targetType} not found`);
                }
                
                isLiked = true;
                likesCount = updated.likesCount;
            }
            
            await session.commitTransaction();
            
            return { isLiked, likesCount };
        } catch (error) {
            await session.abortTransaction();
            throw error;
        } finally {
            session.endSession();
        }
    }
    
    /**
     * Get all liked note IDs for a user
     */
    static async getUserLikedNotes(userId: string): Promise<string[]> {
        const likes = await Like.find({
            userId,
            targetType: 'note',
        }).select('targetId');
        
        return likes.map((like: any) => like.targetId.toString());
    }
    
    /**
     * Check if user has liked specific notes
     */
    static async checkUserLikes(
        userId: string,
        noteIds: string[]
    ): Promise<Map<string, boolean>> {
        const objectIds = noteIds.map(id => new mongoose.Types.ObjectId(id));
        
        const likes = await Like.find({
            userId,
            targetId: { $in: objectIds },
            targetType: 'note',
        }).select('targetId');
        
        const likedMap = new Map<string, boolean>();
        noteIds.forEach(id => likedMap.set(id, false));
        likes.forEach((like: any) => likedMap.set(like.targetId.toString(), true));
        
        return likedMap;
    }
}
