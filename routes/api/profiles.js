const express = require('express');
const router = express.Router();
const auth = require('../../middleware/auth');
const Profile = require('../../models/Profile');
const user = require('../../models/User');
const { check, validationResult } = require('express-validator');
const { compareSync } = require('bcryptjs');


//Retrieve user profile
router.get('/me', auth, async (req,res) => {
    try{
        const profile  = await Profile.findOne({ user: req.user.id}).populate('user',['name','avatar']);

        if(!profile){
            return res.status(400).json({msg : 'Profile not found'});
        }

        res.json(profile);
    }catch(err){
        console.error(err.message);
        res.status(500).send('Server Error');   
    }
});


//Create and update user profiles
router.post('/', [ auth, [
    check('status','status is required').not().isEmpty(),
    check('skills','skills is required').not().isEmpty()
] ] , 
   async (req,res) => {
    const errors = validationResult(req);
    if(!errors.isEmpty()){
        return res.status(400).json({ errors: errors.array() });
    }

    const {
        company,
        website,
        location,
        bio,
        status,
        githubusername,
        skills,
        youtube,
        twitter,
        instagram,
        linkedin,
        facebook,
      } = req.body;

      const profileFields = {};
      profileFields.user = req.user.id;
      if(company) profileFields.company = company;
      if(website) profileFields.website = website;
      if(location) profileFields.location = location;
      if(bio) profileFields.bio = bio;
      if(status) profileFields.status = status;
      if(githubusername) profileFields.githubusername = githubusername;
      if(skills){
          profileFields.skills = skills.split(',').map(skill => skill.trim());
      }
      
      profileFields.social = {}
      if(youtube) profileFields.social.youtube = youtube;
      if(twitter) profileFields.social.twitter = twitter;
      if(facebook) profileFields.social.facebook = facebook;
      if(linkedin) profileFields.social.linkedin = linkedin;
      if(instagram) profileFields.social.instagram = instagram;

      try{
            let profile = await Profile.findOne({ user: req.user.id });

            if(profile){
                profile = await Profile.findOneAndUpdate(
                    { user : req.user.id },
                    { $set : profileFields },
                    { new  : true}
                );

                return res.json(profile);
            }

            profile =  new Profile(profileFields);
            await profile.save();
            res.json(profile);

      }catch(err){
        console.error(err.message);
        res.status(500).send('Server error');
      }
});


//Retrieve all profiles
router.get('/', async ( req, res) => {
    try {
        const profile = await Profile.find().populate('user',['name','avatar']);
        res.json(profile);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');        
    }
});

//Retrieve specific user profiles
router.get('/user/:user_id', async ( req, res) => {
    try {
        const profile = await Profile.findOne({ user : req.params.user_id }).populate('user',['name','avatar']);

        if(!profile){
            return res.status(400).json({ msg: 'There is no such user profile created' });
        }
        res.json(profile);
    } catch (err) {
        console.error(err.message);
        if(err.kind == 'ObjectId'){
            return res.status(400).json({ msg: 'There is no such user profile created' });
        }
        res.status(500).send('Server Error');        
    }
});

//Delete user, profile and posts
router.delete( '/', auth, async ( req, res) => {
    try {
        //Remove Profile
        await Profile.findOneAndRemove({ user : req.user.id });
        //Remove User
        await User.findOneAndRemove({ _id : req.user.id });
        res.json({msg : 'User removed'});
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');        
    }
});


//Adding experience to profiles
router.put('/experience', [auth , [
    check('title', 'Title is required').not().isEmpty(),
    check('company', 'Company is required').not().isEmpty(),
    check('from', 'From Date is required'),
]], 
async ( req, res) => {
    const errors = validationResult(req);
    if(!errors.isEmpty()){
        return res.status(400).json({ errors : errors.array() });
    }

    const{
        title,
        company,
        location,
        from,
        to,
        current,
        description
    } = req.body;

    const newExp = {
        title,
        company,
        location,
        from,
        to,
        current,
        description
    }

    try {

        const profile = await Profile.findOne({ user : req.user.id });
        profile.experience.unshift(newExp);

        await profile.save();

        res.json(profile);
        
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

router.delete('/experience/:exp_id', auth, async (req, res) => {
    
    const profile = await Profile.findOne({ user : req.user.id });

    const removeIndex = profile.experience.map(item => item.id).indexOf(req.params.exp_id);

    profile.experience.splice(removeIndex,1);

    await profile.save();

    res.json(profile);
});

module.exports = router;