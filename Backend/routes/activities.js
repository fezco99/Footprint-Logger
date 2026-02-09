const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");
const Activities = require("../models/activities");
const Users = require("../models/users")

//function to check if act was in the week
function isWithinWeek(date){
  const sevenDaysAgo = new Date()
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)

  return date >= sevenDaysAgo
}

router.get("/getActivities", auth, async (req, res) => {
  try {
    const act = await Activities.findOne({ userId: req.user.userid });

    if (!act) {
      res.status(404).json({ message: "no activities found" });
    }

    res.json(act);
  } catch (error) {
    res.status(500).json(error);
  }
});

router.delete("/deleteActivity", auth, async (req, res) => {
  try{
    const {name} = req.body

    if (!name) {
      return res.status(400).json({ message: "Activity name is required" });
    }

    const activityFind = await Activities.findOne({userId: req.user.userid})

    if(!activityFind){
      res.status(404).json({message: "the activity wasn't found"})
    }

    const index = activityFind.recentActivities.findIndex(act => act.name === name)

    if(index === -1){
      res.status(404).json({message: "the index wasnt found"})
    }

    activityFind.recentActivities.splice(index, 1)

    await activityFind.save()

    res.json({message: "Activity deleted"})
  }
  catch(error){
    res.status(500).json(error)
  }
})

router.get("/allTotal", async(req, res) => {
  try{
    const act = await Activities.find()
    let arr = []

    for(let x = 0; x < act.length; x++){
      arr.push(act[x].recentActivities)
    }

    arr = arr.flat().filter(item => item)

    const total = arr.reduce((acc, v) => acc+v.val, 0)

    res.status(200).json({average: total/act.length})
  }
  catch(error){
    res.status(500).json(error)
  }
})

router.post("/addActivity", auth, async (req, res) => {
  try {
    const act = await Activities.findOne({ userId: req.user.userid });

    if (!act) {
      res.status(404).json({ message: "no activities found" });
    }

    act.recentActivities.push({
      name: req.body.name,
      val: req.body.val,
      category: req.body.category,
      date: new Date()
    });

    await act.save();

    res.status(201).json({ message: "activity added" });
  } catch (error) {
    res.status(500).json(error);
  }
});

router.get("/getWeekly", auth, async (req, res) => {
  try{
    const act = await Activities.findOne({ userId: req.user.userid });

    if (!act) {
      res.status(404).json({ message: "no activities found" });
    }

    let activities = act.recentActivities

    let categoryTotals = [
      {cat: "transport", total: 0},
      {cat: "food", total: 0},
      {cat: "energy", total: 0},
      {cat: "shopping", total: 0}
    ]

    const filtered = activities.filter((ac) => isWithinWeek(ac.date))
    const weeklyTotal = filtered.reduce((acc, v) => acc+ v.val, 0)

    for(let x = 0; x < filtered.length; x++){
      for(let y = 0; y < categoryTotals.length; y++){
        if((categoryTotals[y].cat).toLowerCase() === (filtered[x].category).toLowerCase()){
          categoryTotals[y].total += filtered[x].val
          break
        }
      }
    }

    res.send({total: weeklyTotal, activities: filtered, categoryTotals})
  } 
  catch(error){
    res.status(500).json(error)
  }
})

router.get("/getStreak", auth, async(req, res) => {
  try{
    const act = await Activities.findOne({ userId: req.user.userid });

    if (!act) {
      res.status(404).json({ message: "no activities found" });
    }

    let activities = act.recentActivities
    let streak = 0
    let today = new Date()

    for(let x = 0; x < activities.length; x++){
      const date = new Date(activities[x].date)
      if(date.getFullYear() !== today.getFullYear() || date.getMonth() !== today.getMonth()){
        if(streak > 0) break;
        streak = 0
        break
      }
      let diff = Math.abs(date.getDate() - today.getDate())
      if(diff === 0){
        continue
      }
      else if (diff === 1){
        streak++
        today = activities[x].date
      }
      else{
        if(streak > 0) break;
        streak = 0
        break
      }
    }

    res.status(200).send(streak)
  }
  catch(error){
    res.status(500).json(error)
  }
})

router.post("/addCustom", auth, async (req, res) => {
  try {
    const act = await Activities.findOne({ userId: req.user.userid });

    if (!act) {
      res.status(404).json({ message: "no activities found" });
    }

    act.customAct.push({
      name: req.body.name,
      value: req.body.val,
      category: req.body.category,
    });

    await act.save();

    res.status(201).json({ message: "custom activity added" });
  } catch (error) {
    res.status(500).json(error);
  }
});

router.get("/getCustom", auth, async(req, res) => {
  try{
    const act = await Activities.findOne({ userId: req.user.userid });

    if (!act) {
      res.status(404).json({ message: "no activities found" });
    }

    res.status(200).json(act.customAct);
  }
  catch(error){
    res.status(500).json(error)
  }
})

router.get("/leaderboard", async(req, res) => {
  try{
    let leaderboard = []
    const act = await Activities.find()

    for(let x = 0; x < act.length; x++){
      let total = 0
      if(act[x].recentActivities.length > 0){
        total += act[x].recentActivities.reduce((acc, v) => acc+v.val,0)
      }
      const user = await Users.findOne({_id: act[x].userId})
      leaderboard.push({total: total, name: user.username})
    }

    leaderboard.sort((a, b) => a.total - b.total)
    leaderboard = leaderboard.filter((a) => a.total !== 0)
    res.status(200).send(leaderboard)
  }
  catch(error){
    res.status(500).json(error)
  }
})

module.exports = router;
